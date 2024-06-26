const getCrafts = async() => {
    try {
        //https://arts-and-crafts-0oej.onrender.com/api/crafts
        // http://localhost:3000/api/crafts
        return (await fetch('./api/crafts/')).json();
    } catch (error) {
        console.log('error retrieving data');
        // return '';
    }
};

const showCrafts = async() => {
    const craftsJSON = await getCrafts();
    // const columns = document.getElementsByClassName('column');
    const columns = document.querySelectorAll('.column');
    
    columns.forEach((column) => {
        column.innerHTML = '';
    });

    craftsJSON.forEach((craft, index) => {
        const currentColumn = columns[index % 4];
        const img = document.createElement('img');
        // https://arts-and-crafts-0oej.onrender.com/images/
        //http://localhost:3000/images/
        // './images/'
        img.src = './images/' + craft.image;

        img.onclick = () => {
            showCraftInfo(craft);
        };

        currentColumn.append(img); 
    });
};

const showCraftInfo = (craft) => {
    // document.getElementById('modal').style.display = 'block';

    showModal('craft-details');
    // https://arts-and-crafts-0oej.onrender.com/images/
    //http://localhost:3000/images/
    document.getElementById('img-details').src = './images/' + craft.image;

    const details = document.getElementById('details');
    details.innerHTML = '';

    const h3 = document.createElement('h3');
    h3.innerHTML = craft.name;

    const editButton = document.createElement('button');
    editButton.setAttribute('id', 'btn-edit');
    editButton.innerHTML = '&#128393';
    h3.append(editButton);

    const delButton = document.createElement('button');
    delButton.setAttribute('id', 'btn-del');
    delButton.innerHTML = '&#128465';
    h3.append(delButton);
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

    editButton.onclick = showForm;
    delButton.onclick = deleteCraft.bind(this, craft);

    populateEditForm(craft);
};

const showForm = (e) => {

    showModal('form-add-craft');
    // if we didn't click the edit button to get to here, then we must be adding a craft
    // so reset the form (make it blank)
    if(e.target.getAttribute('id') != 'btn-edit') {
        resetForm();
    }
};

const resetForm = () => {
    const form = document.getElementById('form-add-craft');
    form.reset();
    document.getElementById('supply-inputs').innerHTML = `<input class="block input" type="text" required>`;
    document.getElementById('img-prev').src = 'https://place-hold.it/200x300';
};

const addSupply = (e) => {
    e.preventDefault();
    const section = document.getElementById('supply-inputs');
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('block');
    input.classList.add('input');
    // input.classList.add('supply');
    input.setAttribute('required', '');
    section.append(input);
};

const addEditCraft = async(e) => {
    e.preventDefault();
    // get form
    const form = document.getElementById('form-add-craft');
    
    // get data from form
    const formData = new FormData(form);
    let response;
    // get supplies to add to form data
    formData.append('supplies', getSupplies());

    // if the craft has no current _id (it is a new craft that does not exist in the crafts array)
    if(form._id.value.trim() == '') {
        response = await fetch('./api/crafts', {
            method: 'POST',
            body: formData
        });
    // if the craft does have an _id (it already exists so we must be editing it)
    } else {
        response = await fetch(`./api/crafts/${form._id.value}`, {
            method: 'PUT',
            body: formData
        });
    }

    if(response.status != 200) {
        // console.log('error adding / editing data');
        const resultSection = document.getElementById('result');
        resultSection.innerHTML = 'An error occurred. Please make sure that everything is filled out, including the image!';
        setTimeout(() => resultSection.innerHTML = '', 5000);
        return;
    }

    await response.json();
    resetForm();
    closeModal();
    showCrafts();
};

const deleteCraft = async(craft) => {
    // get the passed in craft's id and delete it
    let response = await fetch(`/api/crafts/${craft._id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });

    if(response.status != 200) {
        console.log('error deleting');
        return;
    }

    let result = await response.json();
    resetForm();
    showCrafts();
    closeModal();
};

// const editCraft = async(e) => {
//     e.preventDefault();
//     showForm();

// };

const populateEditForm = (craft) => {
    const form = document.getElementById('form-add-craft');
    form._id.value = craft._id;
    form.name.value = craft.name;
    form.description.value = craft.description
    document.getElementById('img-prev').src = './images/' + craft.image;
    populateSupplies(craft.supplies);
};

const populateSupplies = (supplies) => {
    const section = document.getElementById('supply-inputs');
    section.innerHTML = '';
    supplies.forEach((supply) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('value', supply);
        input.classList.add('input');
        section.append(input);
    });
};

const getSupplies = () => {
    const inputs = document.querySelectorAll('#supply-inputs input');
    const supplies = [];

    inputs.forEach((input) => {
        supplies.push(input.value);
    });

    return supplies;
};

const showModal = (id) => {
    document.getElementById('modal').style.display = 'block';
    document.querySelectorAll('#modal-details > *').forEach((element) => {
        element.classList.add('hidden');
    });
    document.getElementById(id).classList.remove('hidden');
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
document.getElementById('btn-cancel').onclick = closeModal;
document.getElementById('form-add-craft').onsubmit = addEditCraft;
document.getElementById('btn-add').onclick = showForm;
document.getElementById('add-supply').onclick = addSupply;
// document.getElementById('btn-img').onclick = document.getElementById('image').click(e.preventDefault());`
document.getElementById('image').onchange = (e) => {
    const prev = document.getElementById('img-prev');

    if(!e.target.files.length) {
        prev.src = 'https://place-hold.it/200x300';
        return;
    }

    prev.src = URL.createObjectURL(e.target.files.item(0));
};