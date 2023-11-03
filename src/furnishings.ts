export interface FurnishingInfo {
	position: string,
	w: number,
	d: number,
	h: number,
	placement?: string
};

export const FURNISHINGS: Record<string, FurnishingInfo> = {
	// curtainShort: { position: 'wallEdge', w:1, d:1, h:1 },
	// mirrorShort: { position: 'wallEdge', w:1, d:1, h:1 },
	// mirrorTall: { position: 'wallEdge', w:1, d:1, h:2 },
	// paintingTall: { position: 'wallEdge', w:1, d:1, h:2 },
	// door: { position: 'wallEdge', w:1, d:1, h:2 },
	// dresserShort: { position: 'wallEdge', w:2, d:1, h:1 },
	// dresserTall: { position: 'wallEdge', w:2, d:1, h:2 },
	// grandfatherClock: { position: 'wallEdge', w:1, d:1, h:2 },
	EMPTY: { position: 'wallEdge', w: 1, d: 1, h: 2 },
	curtain: { position: 'wallEdge', w: 2, d: 1, h: 2, placement: 'exteriorWall' },
	paintingSml: { position: 'wallEdge', w: 1, d: 1, h: 1 },
	couch: { position: 'wallEdge', w: 2, d: 1, h: 1 },
	armchair: { position: 'wallEdge', w: 1, d: 1, h: 1 },
	bed: { position: 'wallEdge', w: 2, d: 2, h: 1 },
	cobwebEdgeEdge: { position: 'wallEdge', w: 1, d: 1, h: 1 },
	wardrobe: { position: 'wallEdge', w: 2, d: 1, h: 2 },
	fireplace: { position: 'wallEdge', w: 2, d: 1, h: 2 },
	bookcaseNarr: { position: 'wallEdge', w: 1, d: 1, h: 2 },
	bookcaseShNr: { position: 'wallEdge', w: 1, d: 1, h: 1 },
	bookcaseWide: { position: 'wallEdge', w: 2, d: 1, h: 2 },
	bookcaseShor: { position: 'wallEdge', w: 2, d: 1, h: 2 },
	chest: { position: 'wallEdge', w: 1, d: 1, h: 1 },
	pottedPlant: { position: 'wallEdge', w: 1, d: 1, h: 2 },
	candelabra: { position: 'wallEdge', w: 1, d: 1, h: 2 },
	gargoyle: { position: 'wallEdge', w: 1, d: 1, h: 2 },
	chair: { position: 'wallEdge', w: 1, d: 1, h: 1 },
	couchCenter: { position: 'freeStanding', w: 2, d: 1, h: 1 },
	squareTable: { position: 'freeStanding', w: 1, d: 1, h: 1 },
	tableRound: { position: 'freeStanding', w: 2, d: 2, h: 1 },
	diningTable3: { position: 'freeStanding', w: 4, d: 1, h: 1 },
	diningTable4: { position: 'freeStanding', w: 3, d: 1, h: 1 },
	endtable: { position: 'wallEdge', w: 1, d: 1, h: 1 },
};


