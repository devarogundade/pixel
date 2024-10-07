import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RELAYER: string = "0x60E0a0eAd051314E7510AE803334A97f13E6ff21";
const WORMHOLE_CORE: string = "0x706abc4E45D419950511e474C7B9Ed348A4a716c";

const PixelModule = buildModule("PixelModule", (m) => {
  const pixel = m.contract("Pixel", [RELAYER, WORMHOLE_CORE]);

  return { pixel };
});

export default PixelModule;
