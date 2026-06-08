import React from "react";

export function Footer() {
    return (
        <footer className="w-full border-t bg-transparent">
            <div className="container max-w-6xl mx-auto px-4 py-10">
                <div className="text-center text-sm text-muted-foreground">
                    Copyright © {new Date().getFullYear()} ImagineYuLuo. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;


