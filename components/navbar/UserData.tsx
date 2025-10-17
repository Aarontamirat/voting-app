import { stackServerApp } from "@/stack/server";
export default async function UserData() {
  await stackServerApp.getUser({ or: 'redirect' });
}