import Image from "next/image";
import Maps from "./maps/page";
import MarkersPage from "./markers/page";

export default function Home() {
  const position = { lat: 55.67594, lng: 12.56553 }; // Example position (CPH)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Maps />
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
      </main>
    </div>
  );
}
