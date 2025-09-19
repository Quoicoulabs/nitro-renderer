import { IMessageDataWrapper, IMessageParser } from '../../../../../../../api';

export class TwitchDisplayStreamMessageParser implements IMessageParser
{
    private _itemId: number;
    private _channelName: string;
    private _displayName: string;
    private _isLive: boolean;
    private _streamTitle: string;

    flush(): boolean
    {
        this._itemId = -1;
        this._channelName = null;
        this._displayName = null;
        this._isLive = false;
        this._streamTitle = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._itemId = wrapper.readInt();
        this._channelName = wrapper.readString();
        this._displayName = wrapper.readString();
        this._isLive = wrapper.readBoolean();
        this._streamTitle = wrapper.readString();
        return true;
    }

    public get itemId(): number
    {
        return this._itemId;
    }

    public get channelName(): string
    {
        return this._channelName;
    }

    public get displayName(): string
    {
        return this._displayName;
    }

    public get isLive(): boolean
    {
        return this._isLive;
    }

    public get streamTitle(): string
    {
        return this._streamTitle;
    }
}