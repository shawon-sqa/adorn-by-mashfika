import { redirect } from "next/navigation";

export default function JewelryPage() {
  redirect("/shop?category=jewelry");
}
