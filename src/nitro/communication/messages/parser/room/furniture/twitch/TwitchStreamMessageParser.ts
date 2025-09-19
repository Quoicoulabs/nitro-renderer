import { IMessageDataWrapper, IMessageParser } from '../../../../../../../api';

export class TwitchStreamMessageParser implements IMessageParser
{
    private _itemId: number;
    private _channel: string;
    private _startTime: number;
    private _duration: number;
    private _isLive: number;
    private _gameName: string;
    private _title: string;
    private _displayName: string;

    flush(): boolean
    {
        this._itemId = -1;
        this._channel = null;
        this._startTime = 0;
        this._duration = 0;
        this._isLive = 0;
        this._gameName = null;
        this._title = null;
        this._displayName = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._itemId = wrapper.readInt();
        this._channel = wrapper.readString();
        this._startTime = wrapper.readInt();
        this._duration = wrapper.readInt();
        this._isLive = wrapper.readInt();
        this._gameName = wrapper.readString();
        this._title = wrapper.readString();
        this._displayName = wrapper.readString();
        return true;
    }

    public get itemId(): number
    {
        return this._itemId;
    }

    public get channel(): string
    {
        return this._channel;
    }

    public get startTime(): number
    {
        return this._startTime;
    }

    public get duration(): number
    {
        return this._duration;
    }

    public get isLive(): number
    {
        return this._isLive;
    }

    public get gameName(): string
    {
        return this._gameName;
    }

    public get title(): string
    {
        return this._title;
    }

    public get displayName(): string
    {
        return this._displayName;
    }
}