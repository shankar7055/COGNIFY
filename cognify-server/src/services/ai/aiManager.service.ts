import { MeshProvider }
from "./providers/mesh.provider";

const provider =
  new MeshProvider();

export const aiManager = {

  async generate(
    prompt: string
  ) {

    return provider.generateResponse(
      prompt
    );

  },
};