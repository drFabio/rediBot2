const levelInfo = [
  {
    description: "Reach tile 4, there are no fires",
    numberOfTiles: 4
  },
  {
    description: "Reach Tile #4. Extinguish the fires on #2 and #4.",
    numberOfTiles: 4,
    fires: [{ position: 2 }, { position: 4 }]
  },
  {
    description: "Reach tile #4. Extinguish the fires wherever you find them.",
    numberOfTiles: 4,
    dynamicFires: true
  },
  {
    description:
      "Reach tile #4. Extinguish the fires wherever you find them. Use no more than 5 lines of code.",
    numberOfTiles: 4,
    dynamicFires: true,
    maxBlocks: 5
  },
  {
    description:
      "Reach the last tile. Extinguish the fires wherever you find them. ",
    dynamicBlocks: true,
    dynamicFires: true
  },
  {
    description:
      "Reach the last tile. Extinguish the fires wherever you find them. Stop moving forward when RediBot runs out of water.",
    dynamicBlocks: true,
    dynamicFires: true,
    maxFires: false
  }
];
