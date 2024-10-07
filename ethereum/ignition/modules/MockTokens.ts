import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MockTokensModule = buildModule("MockTokensModule", (m) => {
  const bayc = m.contract("BAYC");
  const punks = m.contract("PUNKS");

  return { bayc, punks };
});

export default MockTokensModule;
