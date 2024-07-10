import React, { useEffect, useRef } from 'react';
import { jsPlumb } from 'jsplumb';
import '../styles/graph.css'
import facebook from '../content/images/facebook.webp';
import amazon from '../content/images/amazon.webp';
import apple from '../content/images/apple.webp';
import netflix from '../content/images/netflix.webp';
import google from '../content/images/google.webp';

const Graph = ({ onNodeClick }) => {
  const jsPlumbContainerRef = useRef(null);

  useEffect(() => {
    jsPlumb.importDefaults({
      ConnectionsDetachable: false,
    });

    jsPlumb.setContainer(jsPlumbContainerRef.current);

    const sourceId = "faang";
    const targetIds = ["Facebook", "Amazon", "Apple", "Netflix", "Google"];

    // Make all nodes draggable
    jsPlumb.draggable(sourceId, { containment: 'parent' });
    targetIds.forEach(targetId => {
      jsPlumb.draggable(targetId, { containment: 'parent' });
    });

    // Create connections
    targetIds.forEach(targetId => {
      if (document.getElementById(sourceId) && document.getElementById(targetId)) {
        jsPlumb.connect({
          source: sourceId,
          target: targetId,
          connector: ["Bezier"],
          overlays: [
            ['Arrow', { location: 1, width: 12, length: 12 }]
          ],
          endpoints: [['Dot', { radius: 1 }], 'Blank'],
          paintStyle: { stroke: '#7f8c8d', strokeWidth: 2 },
          endpointStyle: { fillStyle: '#7f8c8d' },
          anchor: ['Continuous', { faces: ['left', 'right', 'top', 'bottom'] }],
        });
      }
    });

    const handleResize = () => {
      jsPlumb.repaintEverything();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      jsPlumb.reset();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="graph" ref={jsPlumbContainerRef}>
      <div id="faang" className="node">FAANGCode</div>
      <div id="Facebook" className="node" onClick={() => onNodeClick('facebook')}><img src={facebook} alt="Facebook" /></div>
      <div id="Amazon" className="node" onClick={() => onNodeClick('amazon')}><img src={amazon} alt="Amazon" /></div>
      <div id="Apple" className="node" onClick={() => onNodeClick('apple')}><img src={apple} alt="Apple" /></div>
      <div id="Netflix" className="node" onClick={() => onNodeClick('netflix')}><img src={netflix} alt="Netflix" /></div>
      <div id="Google" className="node" onClick={() => onNodeClick('google')}><img src={google} alt="Google" /></div>
    </div>
  );
};

export default Graph;
