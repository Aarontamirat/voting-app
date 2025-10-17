
import { SignIn } from "@stackframe/stack";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center max-w-md w-full p-4 rounded-md space-y-8 shadow-md hover:shadow-2xl transition-shadow duration-300">
                <SignIn />
            </div>
        </div>
    )
}