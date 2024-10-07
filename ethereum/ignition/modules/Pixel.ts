import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RELAYER: string = "0x60E0a0eAd051314E7510AE803334A97f13E6ff21";
const WORMHOLE_CORE: string = "0xa10f2eF61dE1f19f586ab8B6F2EbA89bACE63F7a";

const PixelModule = buildModule("PixelModule", (m) => {
  const addressToBytes32 = m.library("AddressToBytes32");

  const pixel = m.contract("Pixel", [RELAYER, WORMHOLE_CORE],
    {
      libraries: {
        AddressToBytes32: addressToBytes32
      }
    }
  );

  return { pixel };
});

export default PixelModule;
