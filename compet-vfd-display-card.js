/** COMPET VFD Display Card for Home Assistant - Version 0.3.1 */
import { CompetVfdDisplayCard } from "./compet-vfd-card.js?v=0.3.1";
const COMPET_VFD_VERSION = "0.3.1";

const inheritedStyles = CompetVfdDisplayCard.prototype._styles;
CompetVfdDisplayCard.prototype._styles = function () {
  return inheritedStyles.call(this) + String.raw`
    .ghost-segment,.segment-glow,.segment-band,.segment-guide{fill:none;stroke-linecap:butt;stroke-linejoin:round}
    .ghost-segment{stroke:var(--off);stroke-width:var(--segment-width);opacity:.48}
    .segment-glow{stroke:var(--glow);stroke-width:var(--segment-glow-width);opacity:.34}
    .segment-band{stroke:var(--glow);stroke-width:var(--segment-width);opacity:.86}
    .segment-guide{stroke:transparent;stroke-width:.1;pointer-events:none}
    .phosphor-dot{fill:var(--phosphor);filter:drop-shadow(0 0 .7px var(--glow));pointer-events:none}
    .tube.original .segment-band{opacity:.82}
    .tube.original .ghost-segment{opacity:.31}
    .tube.alternative .segment-band{stroke-linecap:round}
    .tube.alternative .segment-glow{stroke-linecap:round}
    .tube.switching .segment-band,.tube.switching .segment-glow,.tube.switching .phosphor-dot{animation:sw var(--duration)}
    .decimal-marker-wrap{position:absolute;z-index:9;bottom:calc(-1px*var(--s));width:calc(17px*var(--s));height:calc(23px*var(--s));transform:translateX(-50%) rotate(-1.5deg);pointer-events:none}
    .decimal-marker-svg{display:block;width:100%;height:100%;overflow:visible}
    .marker-shadow{fill:rgba(0,0,0,.75);filter:blur(.75px)}
    .marker-left{fill:#65100d}
    .marker-centre{fill:var(--marker)}
    .marker-right{fill:#ff5f53;opacity:.72}
    .marker-lower{fill:#8b1712}
    .marker-highlight{fill:none;stroke:#ffc1ba;stroke-width:1.15;stroke-linecap:round;opacity:.62}
    .marker-scratch{fill:none;stroke:#6b0b08;stroke-width:.45;stroke-linecap:round;opacity:.42}
  `;
};

if (!customElements.get("compet-vfd-display-card")) customElements.define("compet-vfd-display-card", CompetVfdDisplayCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "compet-vfd-display-card")) window.customCards.push({type:"compet-vfd-display-card",name:"COMPET VFD Display",description:"Photorealistic COMPET 18 inspired glass-cylinder display.",preview:true,documentationURL:"https://github.com/loungelizard2018/compet-vfd-display-card"});
console.info(`%c COMPET-VFD-DISPLAY-CARD %c v${COMPET_VFD_VERSION} `,"color:white;background:#123b21;font-weight:700;","color:#07150c;background:#45f47e;");
