import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";
import { signIn } from "next-auth/react";

export default function LoginButton() {
    return (
        <Button
            variant="default"
            size="lg"
            className="flex items-center gap-2"
            onClick={() => signIn("discord")}
        >
            <FaDiscord />
            Discord 登入
        </Button>
    );
}