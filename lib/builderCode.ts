export const builderCode =
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE?.trim() || "bc_jygg2lkx";

export const toDataSuffix = (code: string): `0x${string}` => {
  const bytes = new TextEncoder().encode(code);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const lenHex = bytes.length.toString(16).padStart(2, "0");
  return `0x${hex}${lenHex}00${"8021".repeat(8)}` as `0x${string}`;
};

export const getDataSuffix = (): `0x${string}` => toDataSuffix(builderCode);

export const sendCallsCapabilities = () => ({ dataSuffix: getDataSuffix() });

export const appendBuilderCodeSuffix = (data: `0x${string}`): `0x${string}` => {
  const suffix = getDataSuffix().slice(2);
  return ((data || "0x") + suffix) as `0x${string}`;
};
