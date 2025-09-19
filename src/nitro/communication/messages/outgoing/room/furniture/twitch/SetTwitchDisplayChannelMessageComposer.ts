import { IMessageComposer } from '../../../../../../../api';

export class SetTwitchDisplayChannelMessageComposer implements IMessageComposer<ConstructorParameters<typeof SetTwitchDisplayChannelMessageComposer>>
{
    private _data: ConstructorParameters<typeof SetTwitchDisplayChannelMessageComposer>;

    constructor(k: number, channel: string)
    {
        this._data = [k, channel];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}