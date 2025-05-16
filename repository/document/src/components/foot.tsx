import React, { useState, useEffect } from "react";
export default function FootPackage() {
    const [currentTime, setCurrentTime] = useState("");
    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const dayNumber = now.getDate();
            const year = now.getFullYear();
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = days[now.getDay()];
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthName = months[now.getMonth()];
            const monthNumber = now.getMonth() + 1;
            const formattedDate = `(${dayName} ${dayNumber}/${monthName} ${monthNumber}/${year})`;
            setCurrentTime(formattedDate);
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);
    return (
        <footer id="Footer" className="p-6 flex flex-wrap items-baseline justify-center text-red-700">
            <span className="text-4xl font-black mr-2">YT-DLX</span>
            <span className="mt-2 text-sm font-bold">© Copyright 2023 - {currentTime}</span>
        </footer>
    );
}
