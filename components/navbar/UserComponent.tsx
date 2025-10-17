import { UserButton, useUser } from "@stackframe/stack";
import { Button } from "../ui/button";
import Link from "next/link";

const UserComponent = () => {

    const user = useUser();

  return (
    <>
        {user && (
                    <div className="hidden md:flex items-center space-x-6">
                        <UserButton />
                    </div>
                )}
        
        {!user && (
            <div className="hidden md:flex space-x-4">
            <Link
                href="/sign-in"
                className=""
            >
                <Button variant="default" >
                Sign In
                </Button>
            </Link>
            <Link
                href="/sign-up"
                className=""
            >
                <Button variant={"outline"} >
                Sign Up
                </Button>
            </Link>
            </div>
        )}
    </>
  )
}

export default UserComponent