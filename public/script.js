const getCrafts = async() => {
    try {
        return (await fetch('http://localhost:3000/api/crafts')).json();
    } catch (error) {
        console.log('error retrieving data');
        return '';
    }
};

const showCrafts = async() => {
    const craftsJSON = await getCrafts();
    const columns = document.getElementsByClassName('column');

    craftsJSON.forEach((craft, index) => {
        const currentColumn = columns[index % 4];
        const img = document.createElement('img');
        img.src = 'http://localhost:3000/images/' + craft.image;

        img.onclick = () => {
            showModal(craft);
        };

        currentColumn.append(img); 
    });
};

const showModal = (craft) => {
    document.getElementById('modal').style.display = 'block';
    document.getElementById('img-details').src = 'http://localhost:3000/images/' + craft.image;

    const details = document.getElementById('details');
    details.innerHTML = '';

    const h3 = document.createElement('h3');
    h3.innerHTML = craft.name;

    const button = document.createElement('button');
    button.setAttribute('id', 'btn-edit');
    button.innerHTML = '&#128393';
    h3.append(button);
    details.append(h3);

    const p = document.createElement('p');
    p.innerHTML = craft.description;
    details.append(p);

    const h4 = document.createElement('h4');
    h4.innerHTML = 'Supplies:';
    details.append(h4);

    const ul = document.createElement('ul');
    craft.supplies.forEach((supply) => {
        const li = document.createElement('li');
        li.innerHTML = supply;
        ul.appendChild(li);
    });

    details.append(ul);
};

const closeModal = () => {
    document.getElementById('modal').style.display = 'none';
};

window.onclick = (e) => {
    if(e.target == document.getElementById('modal'))
        closeModal();
};

showCrafts();
document.getElementById('close').onclick = closeModal;