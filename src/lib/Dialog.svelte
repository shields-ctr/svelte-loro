<script lang="ts">
  import {onMount, getContext} from 'svelte';

  const commands = [
    "JOIN", "PRIVMSG", "PART", "QUIT"
  ];
  
  // TODO instead of hard-coding, load these from the bot API? Infer them from the script?
  let users:string[] = $state(['Operator', 'Raditz', 'Nappa', 'Vegeta', 'Ginyu', 'Frieza', 'Nappa']);
  let channels:string[] = $state(['#namek', '#earth']);

  // get the script from the context
  const script = getContext('script');

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