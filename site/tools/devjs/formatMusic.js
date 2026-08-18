const generateTable = () => {
  const input = document.getElementById('input').value;
  let output = '<table class="tracklist">';
  let current = 0;

  const songs = input.split('\n');
  for (let song of songs) {
    const data = song.split(';');
    for (let i=0; i<4; i++){
      if (data[i] === undefined) data[i] = '';
    }

    current++;
    output += `\n\t<tr data-link="${data[2]}" data-cover="${data[3]}">`;
    output += `\n\t\t<td>${current}</td>`;
    if (data[2] !== '') output += `\n\t\t<td><a href="https://youtu.be/${data[2]}">${data[0]}</a></td>`;
    else output += `\n\t\t<td>${data[0]}</td>`;
    output += `\n\t\t<td>${data[1]}</td>`;
    output += `\n\t</tr>`;
  }

  output += '\n</table>';
  document.getElementById('preview').innerHTML = output;
  document.getElementById('output').innerText = output;
}