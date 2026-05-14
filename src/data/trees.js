// Data source: https://open.toronto.ca/dataset/street-tree-data/

const trees = [
  ["Ash, green", 55.67594, 12.56553],
  ["Birch, white", 55.68000, 12.57000],
  ["Maple, Manitoba", 55.67000, 12.56000],
  ["Elm, American 'Valley Forge'", 55.68500, 12.17500],
  ["Spruce, Colorado blue", 55.68000, 12.56500],
  ["Maple, Norway 'Schwedler'", 55.67500, 12.57000],
  ["Mulberry, white", 55.57594, 12.56553],
  ["Elm, Siberian", 55.68000, 12.57000],
  ["Kentucky coffee", 55.67594, 12.56553],
  ["Katsura, Japanese", 55.67594, 12.56553],
  ["Elm, American", 55.68000, 12.57000],
  ["Maple, Norway", 55.67594, 12.56553],
  ["Oak, white", 55.68000, 12.57000],
  ["Honey locust, 'Skyline'", 55.68000, 12.57000],
  ["Cherry", 55.67594, 12.56553],
  ["Maple, Norway", 55.68000, 12.57000],
  ["Hackberry", 55.67594, 12.56553],
  ["Maple, Norway globe", 55.67594, 12.53553],
  ["Walnut, black", 55.67594, 12.51553],
  ["Maple, Norway", 55.67594, 12.56253],
  ["Maple, Manitoba", 55.67594, 12.42]
];

const formatted = trees.map(([name, lat, lng]) => ({
  name,
  lat,
  lng,
  key: JSON.stringify({ name, lat, lng }),
}));

export default formatted;
