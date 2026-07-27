const fractions=(count,start=.04,end=.96)=>Object.freeze(Array.from({length:count},(_,index)=>Number((start+(end-start)*(count===1?.5:index/(count-1))).toFixed(6))));
const physicalSegment=({id,name,path,width,dots,startInset=1,endInset=1,derivedFrom=null,maskSource=null})=>Object.freeze({id,name,path,d:path,width,startInset,endInset,linecap:"butt",dotFractions:fractions(dots),derivedFrom,maskSource});

/**
 * Eight immutable SHARP COMPET 18 electrode identities. The original style is
 * rendered from the photographic 48x80 four-level masks in
 * compet-vfd-segment-masks.js. These guide paths remain for debug overlays and
 * preserve stable segment metadata.
 */
export const ORIGINAL_SEGMENTS=Object.freeze({
 A:physicalSegment({id:"A",name:"upper-left-return",path:"M33.8 16 L29.5 47 L41.5 53",width:4.05,dots:18,maskSource:"A@48x80"}),
 B:physicalSegment({id:"B",name:"upper-roof",path:"M30 23.7 C35.7 17.2 47.7 16.7 59.8 19.6",width:3.85,dots:13,maskSource:"B@48x80"}),
 C:physicalSegment({id:"C",name:"upper-right-hook",path:"M62.4 25.2 C64 31 61.3 38.1 56.6 44.4 C52.5 50 48.7 56.5 46 64.7",width:3.85,dots:18,maskSource:"C@48x80"}),
 D:physicalSegment({id:"D",name:"lower-left-sweep",path:"M34 67.3 C31.3 75.5 27.5 82 23.4 87.6 C18.7 93.9 16 101 17.6 106.8",width:3.85,dots:18,derivedFrom:"C@rotate180(23,28)",maskSource:"D@48x80"}),
 E:physicalSegment({id:"E",name:"lower-base",path:"M20.2 112.4 C32.3 115.3 44.3 114.8 50 108.3",width:3.85,dots:13,derivedFrom:"B@rotate180(23,28)",maskSource:"E@48x80"}),
 F:physicalSegment({id:"F",name:"lower-right-return",path:"M41.6 69.9 C48.3 72.5 52 79.2 50.7 85.8 C49.9 90.8 49 94.9 47.5 97.9",width:3.9,dots:13,maskSource:"F@48x80"}),
 G:physicalSegment({id:"G",name:"one-upper-slash",path:"M48.7 17.5 L45.6 20.4 L43.4 49",width:4.15,dots:13,maskSource:"G@48x80"}),
 H:physicalSegment({id:"H",name:"one-lower-slash",path:"M42.4 55 L34.2 106",width:4.25,dots:15,maskSource:"H@48x80"})
});

export const ORIGINAL_DIGIT_SEGMENTS=Object.freeze({
 "0":Object.freeze(["D","E","F"]),"1":Object.freeze(["G","H"]),"2":Object.freeze(["B","C","D","E"]),"3":Object.freeze(["B","C","E","F"]),"4":Object.freeze(["A","G","H"]),"5":Object.freeze(["A","B","E","F"]),"6":Object.freeze(["C","D","E","F"]),"7":Object.freeze(["B","C","H"]),"8":Object.freeze(["A","B","C","D","E","F"]),"9":Object.freeze(["A","B","C","H"])
});
export const ORIGINAL_FIELD_SEGMENTS=Object.freeze(Object.values(ORIGINAL_SEGMENTS));
export function originalSegmentsFor(character){const ids=ORIGINAL_DIGIT_SEGMENTS[String(character)]||[];return Object.freeze(ids.map(id=>ORIGINAL_SEGMENTS[id]))}
