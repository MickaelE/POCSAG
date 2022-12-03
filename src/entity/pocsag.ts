import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

// NSERT INTO `pocsag`.`2021` (`pagerID`, `msgTime`, `msgDate`, `msgEnc`, `msgType`, `msgBaud`, `msgText`
@Entity()
export class Pocsag {
    @PrimaryGeneratedColumn()
    id: number  ;
    @Column()
    pagerID: number;
    @Column({
        length: 25
    })
    msgTime: string;
    @Column()
    msgDate: string;
    @Column()
    msgEnc: string;
    @Column({
        length: 25
    })
    msgType: string;
    @Column()
    msgBaud: number;
    @Column({
        length: 2000
    })
    msgText: string;
}