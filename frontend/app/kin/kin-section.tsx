import { KinList } from "./kin-list"

type Kin = { id: string; name: string }

export function KinSection({ kin }: { kin: Kin[] }) {
  return <KinList kin={kin} />
}
