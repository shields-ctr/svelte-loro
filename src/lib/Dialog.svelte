<script lang="ts">
  import {onMount, getContext} from 'svelte';

  const commands = [
    "JOIN", "PRIVMSG", "PART", "QUIT"
  ];
  
  // TODO instead of hard-coding, load these from the bot API? Infer them from hte script?
  let users:string[] = $state(['Operator', 'Raditz', 'Nappa', 'Vegeta', 'Ginyu', 'Frieza', 'Nappa']);
  let channels:string[] = $state(['#namek', '#earth']);

  // get the script from the context
  const script = getContext('script');
  // let script = $state([
  //   {id:0, time:"12:00:00.00",nick:"Operator",command:"JOIN", args:["#namek"]},
  //   {id:1, time:"12:00:01.00",nick:"Operator",command:"JOIN", args:["#earth"]},
  //   {id:2, time:"12:00:02.00",nick:"Raditz",command:"JOIN", args:["#earth"]},
  //   {id:3, time:"12:00:03.00",nick:"Raditz",command:"PRIVMSG", args:["#earth","aaaahhhh"]},
  //   {id:4, time:"12:00:04.00",nick:"Nappa",command:"JOIN", args:["#earth"]},
  //   {id:5, time:"12:00:05.00",nick:"Vegeta",command:"JOIN", args:["#earth"]},
  //   {id:6, time:"12:00:06.00",nick:"Nappa",command:"PRIVMSG", args:["#earth","waaaaaaagh"]},
  //   {id:7, time:"12:00:07.00",nick:"Vegeta",command:"PRIVMSG", args:["#earth","haaaaaaaah"]},
  //   {id:8, time:"12:00:08.00",nick:"Ginyu",command:"JOIN", args:["#earth"]},
  //   {id:9, time:"12:00:09.00",nick:"Ginyu",command:"PRIVMSG", args:["#earth","aaaaaugh"]},
  //   {id:10, time:"12:00:10.00",nick:"Operator",command:"PRIVMSG", args:["#earth","On the next exciting episode"]},
  //   {id:11, time:"12:00:11.00",nick:"Frieza",command:"JOIN", args:["#earth"]},
  //   {id:12, time:"12:00:12.00",nick:"Frieza",command:"PRIVMSG", args:["#earth","aaaaaaaaaaaaaa"]},
  // ]);
  $effect(() => {
    console.log(script);
  });

  function isSender(user: string, message: any) {
    return (Object.hasOwn(message, 'nick'))
      ? user.toLowerCase() == message.nick.toLowerCase()
      : false;
  }

  function isReceiver(channel: string, message: any) {
    return (Object.hasOwn(message, 'args') && message.args.length)
      ? channel.toLowerCase() == message.args[0].toLowerCase()
      : false;
  }//{"prefix":"raditz!~u@2t4jjv3kfbf4q.irc","nick":"raditz","user":"~u","host":"2t4jjv3kfbf4q.irc","command":"JOIN","rawCommand":"JOIN","commandType":"normal","args":["#TM_C2"]}
  
  function getTime(msg: any) {
    const date = new Date(msg.time);
    const time = date.toTimeString().slice(0,8);
    console.log(time);
    return time;
  }
  
  onMount(async ()=>{
    //users = await api.getBots();
    // channels = await api.getChannels();
    // for (const line of script) {
    //   if (users.every(user => user!=line.nick))
    //     users.push(line.nick);
    //   if (channels.every(channel => channel!=line.args[0]))
    //     channels.push(line.args[0]);
    // }
    // TODO need to initialize channel checkboxes on load!!!
  });

</script>


<table id="dialog">
    <thead>
      <tr>
        <th>time</th>
        {#each users as user}
        <th>{user}</th>
        {/each}
        <th>command</th>
        {#each channels as channel}
        <th>{channel}</th>
        {/each}
        <th>message</th>
      </tr>
    </thead>
    <tbody>
      {#each script as dialog}
      <tr class={dialog.command}>
        <td>
          <input type="text" 
            pattern="([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])"
            value={dialog.time} />
          <!-- <input type="time" 
            step="1"
            value={dialog.time}
          /> -->
          <!-- value={(new Date(dialog.time)).toTimeString().slice(0,8)} -->
        </td>
        {#each users as user}
        <td><input type="radio" 
              name={"user_"+dialog.id}
              checked={isSender(user, dialog)}>
        </td>
        {/each}
        <td>
          <select 
            id={"command_"+dialog.id}>
            {#each commands as command}
            <option value="command"
              selected={command==dialog.command}>
              {command}
            </option>
            {/each}
          </select>

        </td>
        {#each channels as channel}
        <td><input type="radio"
            name={"channel_"+dialog.id}
            onclick={(event)=>console.log(event)}
            checked={isReceiver(channel, dialog)} />
        </td>
        {/each}
        <td>
          <!-- {dialog.nick} -->
          <input type="text"
            value={(dialog.args.length>1) ? dialog.args.slice(1).join(',') : ''}/>
        </td>
        <!-- <td>{(dialog.args.length>0) ? dialog.args[0] : ''}</td> -->
        <!-- <td>{(dialog.args.length>1) ? dialog.args.slice(1).join(',') : ''}</td> -->
      </tr>
      {/each}
    </tbody>
  </table>

  <style>
  table, th, td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  th {
    vertical-align: middle;
    text-align: end;
    writing-mode: vertical-lr;
  }
  /* th:nth-child(n+2) { writing-mode: vertical-lr; } */
  form { padding: 0.25em; }
  td, th {
    margin: 0;
    padding: 0;
  }
</style>