/** COMPET VFD Display Card for Home Assistant - Version 0.3.0 */
import { CompetVfdDisplayCard } from "./compet-vfd-card.js?v=0.3.0";
const COMPET_VFD_VERSION = "0.3.0";

const inheritedStyles = CompetVfdDisplayCard.prototype._styles;
CompetVfdDisplayCard.prototype._styles = function () {
  return inheritedStyles.call(this) + String.raw`
    .tube.original .glyph{stroke-width:3.75;opacity:.9}
    .tube.original .phosphor{stroke-width:1.42;stroke-dasharray:.1 2.45;opacity:.98}
    .tube.original .ghost{stroke-width:3.5;opacity:.42}
    .decimal-marker-wrap{position:absolute;z-index:9;bottom:calc(1px*var(--s));width:calc(18px*var(--s));height:calc(25px*var(--s));transform:translateX(-50%);filter:drop-shadow(0 calc(2px*var(--s)) calc(2px*var(--s)) rgba(0,0,0,.9))}
    .decimal-marker-wrap .decimal-marker{position:absolute;inset:0;display:block;width:100%;height:100%;transform:none;clip-path:polygon(50% 0,82% 30%,72% 82%,50% 100%,27% 82%,18% 30%);background:linear-gradient(90deg,#64100c 0%,#aa211a 23%,var(--marker) 48%,#ff6b5d 58%,#9c1b15 79%,#5d0b08 100%);box-shadow:inset calc(2px*var(--s)) 0 calc(2px*var(--s)) rgba(255,255,255,.22),inset calc(-2px*var(--s)) 0 calc(3px*var(--s)) rgba(60,0,0,.7)}
    .decimal-marker-wrap:before{content:"";position:absolute;z-index:2;left:38%;top:8%;width:19%;height:66%;border-radius:50%;background:linear-gradient(180deg,rgba(255,190,180,.75),rgba(255,255,255,.08));filter:blur(calc(.35px*var(--s)));opacity:.7}
    .decimal-marker-wrap:after{content:"";position:absolute;left:20%;right:20%;bottom:calc(-2px*var(--s));height:calc(4px*var(--s));border-radius:50%;background:rgba(0,0,0,.75);filter:blur(calc(1px*var(--s)))}
  `;
};

if (!customElements.get("compet-vfd-display-card")) customElements.define("compet-vfd-display-card", CompetVfdDisplayCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "compet-vfd-display-card")) window.customCards.push({type:"compet-vfd-display-card",name:"COMPET VFD Display",description:"Photorealistic COMPET 18 inspired glass-cylinder display.",preview:true,documentationURL:"https://github.com/loungelizard2018/compet-vfd-display-card"});
console.info(`%c COMPET-VFD-DISPLAY-CARD %c v${COMPET_VFD_VERSION} `,"color:white;background:#123b21;font-weight:700;","color:#07150c;background:#45f47e;");
