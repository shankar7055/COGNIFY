export interface SpecializedAgent {
    name: string;

    canHandle(
        input: string
    ): boolean;

    handle(
        input: string
    ): Promise<string>;
}