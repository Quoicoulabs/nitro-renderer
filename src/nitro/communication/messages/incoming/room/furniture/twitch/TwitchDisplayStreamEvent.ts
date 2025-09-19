import { IMessageEvent } from '../../../../../../../api';
import { MessageEvent } from '../../../../../../../events';
import { TwitchDisplayStreamMessageParser } from '../../../../parser';

export class TwitchDisplayStreamEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, TwitchDisplayStreamMessageParser);
    }

    public getParser(): TwitchDisplayStreamMessageParser
    {
        return this.parser as TwitchDisplayStreamMessageParser;
    }
}