import { IMessageEvent } from '../../../../../../../api';
import { MessageEvent } from '../../../../../../../events';
import { TwitchStreamMessageParser } from '../../../../parser';

export class TwitchStreamEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, TwitchStreamMessageParser);
    }

    public getParser(): TwitchStreamMessageParser
    {
        return this.parser as TwitchStreamMessageParser;
    }
}