export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BROWSER: "chrome" | "firefox" | "webkit",
            ENV: "stating" | "prod" | "test",
            BASEURL: string,
            HEAD: "true" | "false"
        }
    }
}