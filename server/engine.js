export function reconcileEvents(events) {
  // 1. Sort by timestamp to guarantee determinism and handle late arrivals
  const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const components = {};
  const auditLog = [];
  const seenEvents = new Set(); // NEW: Memory for duplicates

  // NEW: Filter out exact duplicates based on a unique signature
  const uniqueEvents = sortedEvents.filter(ev => {
    const signature = `${ev.source}-${ev.componentId}-${ev.timestamp}-${ev.action}`;
    if (seenEvents.has(signature)) return false;
    seenEvents.add(signature);
    return true;
  });

  // 2. State Reconstruction & Conflict Resolution
  // CHANGED: Loop over uniqueEvents instead of sortedEvents 
  uniqueEvents.forEach(event => {
    const { source, componentId, timestamp, action, data } = event;

    if (!components[componentId]) {
      components[componentId] = { id: componentId, state: {}, history: [] };
    }

    const comp = components[componentId];
    comp.history.push(event);

    if (action === 'delete') {
       comp.state = null;
       auditLog.push({ componentId, timestamp, decision: 'Deleted component', resolver: 'automated' });
       return;
    }

    const newState = { ...comp.state };
    let conflictDetected = false;
    let resolutionNotes = [];

    // PRD Rule A: Prefer SOLACE for animations
    if (data?.animation) {
      if (newState.animationSource === 'solace' && source !== 'solace') {
        conflictDetected = true;
        resolutionNotes.push(`Ignored ${source} animation; preserved SOLACE priority.`);
      } else {
        if (newState.animation && newState.animationSource !== 'solace' && source === 'solace') {
            conflictDetected = true;
            resolutionNotes.push('Overrode existing animation with SOLACE priority.');
        }
        newState.animation = data.animation;
        newState.animationSource = source;
      }
    }

    // PRD Rule B: Resolve layout conflicts by merging
    if (data?.layout) {
       if (newState.layout && newState.layout !== data.layout) {
          conflictDetected = true;
          if (newState.layout.includes('flex-start') || data.layout.includes('flex-start')) {
             newState.layout = 'flex-start';
             resolutionNotes.push(`Merged layout constraints to flex-start.`);
          } else {
             newState.layout = data.layout; // Timestamp tie-breaker
             resolutionNotes.push('Applied latest layout constraint.');
          }
       } else {
          newState.layout = data.layout;
       }
    }

    // Keep non-conflicting properties (like colors)
    if (data) {
        Object.keys(data).forEach(key => {
            if (key !== 'animation' && key !== 'layout') {
                newState[key] = data[key];
            }
        });
    }

    comp.state = newState;

    // Record decision in the audit trail
    auditLog.push({
      componentId,
      timestamp,
      conflictDetected,
      decision: resolutionNotes.length > 0 ? resolutionNotes.join(' ') : 'Standard update applied',
      output: { ...newState }
    });
  });

  return { 
    reconciledState: Object.values(components).map(c => ({ id: c.id, state: c.state })), 
    auditLog 
  };
}