import { SaveTheDate } from "../sections/SaveTheDate";
import { GiftList } from "../sections/GiftList";
import { GiftTable } from "../sections/GiftTable";
import { CartBar } from "../components/CartBar";

export default function Home() {
  return (
    <main>
      <SaveTheDate />
      <GiftList />
      <GiftTable />
      <CartBar />
    </main>
  );
}
