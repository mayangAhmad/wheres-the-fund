'use client'
import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2, University, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface StripeConnectProps {
    isConnected?: boolean;
}

export default function StripeConnectButton({isConnected = false}: StripeConnectProps) {
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stripe/connect", {
                method: "POST",
            });

            const data = await res.json();

            if(data.error) throw new Error(data.error);

            window.location.href = data.url;
        } catch (error: any) {
            toast.error(error.message || "Failed to connect to Stripe");
            setLoading(false);
        }
    };

    if (isConnected) {
        return (
            <Button
                variant="outline"
                className="w-full md:w-auto bg-green-50 text-green-700 border-green-200 hover::bg-green-100 cursor-default">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Bank Connected
                </Button>
        );
    }

    return(
        <Button
            onClick={handleConnect}
            disabled={loading}
            className="w-full md:w-auto bg-[#635BFF] hover:bg-[#534bea] text-white transition-colors shadow-sm">
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <University className="mr-2 h-4 w-4" />
            )}
            Connect Bank (Stripe)
        </Button>
    );
}