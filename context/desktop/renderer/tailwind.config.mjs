import daisyui from "daisyui";
import preline from "preline/plugin";
import flowbite from "flowbite/plugin";
import forms from "@tailwindcss/forms";
import plugin from "tailwindcss/plugin";
import colors from "tailwindcss/colors";
import typography from "@tailwindcss/typography";
export default {
    darkMode: "class",
    content: ["./renderer/pages/**/*.{js,ts,jsx,tsx}"],
    theme: {
        colors: { white: colors.white, gray: colors.gray, blue: colors.blue },
        extend: {
            fontFamily: { Lobster: ["var(--font-Lobster)"], Markazi: ["var(--font-Markazi)"] },
            textShadow: { sm: "0 1px 2px var(--tw-shadow-color)", DEFAULT: "0 2px 4px var(--tw-shadow-color)", lg: "0 8px 16px var(--tw-shadow-color)" },
        },
    },
    plugins: [
        plugin(function ({ matchUtilities, theme }) {
            matchUtilities({ "text-shadow": value => ({ textShadow: value }) }, { values: theme("textShadow") });
        }),
        forms,
        daisyui,
        preline,
        flowbite,
        typography,
    ],
    daisyui: {
        themes: [
            "light",
            "dark",
            "cupcake",
            "bumblebee",
            "emerald",
            "corporate",
            "synthwave",
            "retro",
            "cyberpunk",
            "valentine",
            "halloween",
            "garden",
            "forest",
            "aqua",
            "lofi",
            "pastel",
            "fantasy",
            "wireframe",
            "black",
            "luxury",
            "dracula",
            "cmyk",
            "autumn",
            "business",
            "acid",
            "lemonade",
            "night",
            "coffee",
            "winter",
            "dim",
            "nord",
            "sunset",
        ],
    },
};
