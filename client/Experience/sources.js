export default [
  {
    name: "environmentMapTexture",
    type: "cubeTexture",
    path: [
      "./Static/textures/environmentMap/px.jpg",
      "./Static/textures/environmentMap/nx.jpg",
      "./Static/textures/environmentMap/py.jpg",
      "./Static/textures/environmentMap/ny.jpg",
      "./Static/textures/environmentMap/pz.jpg",
      "./Static/textures/environmentMap/nz.jpg",
    ],
  },
  {
    name: "grassColorTexture",
    type: "texture",
    path: "./Static/textures/dirt/color.jpg",
  },
  {
    name: "grassNormalTexture",
    type: "texture",
    path: "./Static/textures/dirt/normal.jpg",
  },
  {
    name: "foxModel",
    type: "gltfModel",
    path: "./Static/models/Fox/glTF/Fox.gltf",
  },
  // {
  //   name: "foxModel1",
  //   type: "gltfModel",
  //   path: "../client/Static/models/Fox/glTF/Fox.gltf",
  // },
  // {
  //   name: "foxModel2",
  //   type: "gltfModel",
  //   path: "../client/Static/models/Fox/glTF/Fox.gltf",
  // },
];
