import colors from "colors";
import { z, ZodError } from "zod";
import TubeResponse from "../../interfaces/TubeResponse";
import TubeLogin, { TubeType } from "../../utils/TubeLogin";
const ZodSchema = z.object({ Cookies: z.string(), Verbose: z.boolean().optional() });
type UnseenNotificationsOptions = z.infer<typeof ZodSchema>;
export default async function unseen_notifications(options: UnseenNotificationsOptions): Promise<TubeResponse<{ count: number }>> {
    let Verbose = false;
    try {
        ZodSchema.parse(options);
        const { Verbose: parsedVerbose, Cookies } = options;
        Verbose = parsedVerbose ?? false;
        if (Verbose) console.log(colors.green("@info:"), "Fetching unseen notifications...");
        if (!Cookies) throw new Error(`${colors.red("@error:")} Cookies not provided!`);
        const client: TubeType = await TubeLogin(Cookies);
        if (!client) throw new Error(`${colors.red("@error:")} Could not initialize Tube client.`);
        const count = await client.getUnseenNotificationsCount();
        if (count === undefined) throw new Error(`${colors.red("@error:")} Failed to fetch unseen notifications count.`);
        const result: TubeResponse<{ count: number }> = { status: "success", data: { count: Number(count) || 0 } };
        return result;
    } catch (error) {
        if (error instanceof ZodError) throw new Error(`${colors.red("@error:")} Argument validation failed: ${error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        else if (error instanceof Error) throw error;
        else throw new Error(`${colors.red("@error:")} An unexpected error occurred: ${String(error)}`);
    } finally {
        if (Verbose) console.log(colors.green("@info:"), "❣️ Thank you for using yt-dlx. Consider 🌟starring the GitHub repo https://github.com/yt-dlx.");
    }
}
