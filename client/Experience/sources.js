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
    name: "animeCharacter",
    type: "gltfModel",
    path: "./Static/models/Girl/animeGirl.glb",
  },
  {
    name: "gltfMap",
    type: "gltfModel",
    path: "./Static/models/Square/out.glb",
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
