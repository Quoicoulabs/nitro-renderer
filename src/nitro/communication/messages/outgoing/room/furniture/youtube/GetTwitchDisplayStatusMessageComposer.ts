import { IMessageComposer } from '../../../../../../../api';

export class GetTwitchDisplayStatusMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetTwitchDisplayStatusMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetTwitchDisplayStatusMessageComposer>;

    constructor(k: number)
    {
        this._data = [k];
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