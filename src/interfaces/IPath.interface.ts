/**
 * Interface for path
 */
export interface IPath
{
    /**
     * Path
     */
    path: string;
    /**
     * Regex for matching the path
     */
    test: RegExp;
}