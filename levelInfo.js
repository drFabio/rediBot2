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
      "Reach tile #4. Extinguish the fires wherever you find them. Use  as little code as possible.",
    numberOfTiles: 4,
    dynamicFires: true,
    maxBlocks: 5
  },
  {
    description:
      "Reach the last tile. Extinguish the fires wherever you find them. ",
    dynamicTiles: true,
    dynamicFires: true
  },
  {
    description:
      "Extinguish the fires wherever you find them. Stop moving forward when RediBot runs out of water.",
    dynamicTiles: true,
    dynamicFires: true,
    unlimitedFires: true,
    checkSuccess(finalRunData) {
      const {
        fires,
        waterSupply,
        extinguishedFires,
        currentPosition,
        numberOfTiles,
        positionThatWaterRunOut
      } = finalRunData;
      if (waterSupply !== 0) {
        return {
          passed: false,
          message: "You did not spent all the water"
        };
      }
      const extinguishedAllFiresBefore = extinguishedFires.every(
        pos => pos <= currentPosition
      );
      if (!extinguishedAllFiresBefore) {
        return {
          passed: false,
          message: "You did not extinguished all fires you encountered"
        };
      }
      if (positionThatWaterRunOut !== currentPosition) {
        return {
          passed: false,
          message: "You did not stop when the water run out"
        };
      }
      return { passed: true };
    }
  }
];
