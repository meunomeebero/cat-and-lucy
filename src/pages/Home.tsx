import { SaveTheDate } from "../sections/SaveTheDate";
import { GiftList } from "../sections/GiftList";
import { GiftTable } from "../sections/GiftTable";

export default function Home() {
  return (
    <main>
      <SaveTheDate />
      <GiftList />
      <GiftTable />
    </main>
  );
}
