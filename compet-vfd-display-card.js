/** COMPET VFD Display Card for Home Assistant - Version 0.2.0 */
import { CompetVfdDisplayCard } from "./compet-vfd-card.js?v=0.2.0";
const COMPET_VFD_VERSION = "0.2.0";
if (!customElements.get("compet-vfd-display-card")) customElements.define("compet-vfd-display-card", CompetVfdDisplayCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "compet-vfd-display-card")) window.customCards.push({type:"compet-vfd-display-card",name:"COMPET VFD Display",description:"Photorealistic COMPET 18 inspired glass-cylinder display.",preview:true,documentationURL:"https://github.com/loungelizard2018/compet-vfd-display-card"});
console.info(`%c COMPET-VFD-DISPLAY-CARD %c v${COMPET_VFD_VERSION} `,"color:white;background:#123b21;font-weight:700;","color:#07150c;background:#45f47e;");
