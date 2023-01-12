export class ErrorServiceInit extends Error
{
    public constructor()
    {
        super("Service not initalized yet");
    }
}