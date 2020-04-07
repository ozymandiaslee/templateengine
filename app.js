const Manager = require('./lib/Manager');
const Engineer = require('./lib/Engineer');
const Intern = require('./lib/Intern');
const inquirer = require('inquirer');
const fs = require('fs');
const util = require('util');
const path = require('path');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const teamMembers = [];
const idArray = [];

const getQuestions = teamMember => [
    {
        type: 'input',
        name: 'name',
        message: `What is your ${teamMember}'s name?`
    },
    {
        type: 'input',
        name: 'id',
        message: `What is your ${teamMember}'s id?`
    },
    {
        type: 'input',
        name: 'email',
        message: `What is your ${teamMember}'s email?`
    }
]

const teamMenu = () => {

    const createManager = async () => {
        const response = await inquirer.prompt([
            ...getQuestions('manager'),
            {
                type: 'input',
                name: 'officeNumber',
                message: "What is your manager's office number?"
            }
        ]);

        const { name, id, email, officeNumber } = response;
        const manager = new Manager(name, id, email, officeNumber);

        teamMembers.push(manager);
        idArray.push(id);

        createTeam();
        console.log(teamMembers)
        console.log(idArray);
    }

    const addEngineer = async () => {
        const response = await inquirer.prompt([
            ...getQuestions('engineer'),
            {
                type: 'input',
                name: 'github',
                message: "What is your engineer's Github username?"
            }
        ])

        const { name, id, email, github } = response;
        const engineer = new Engineer(name, id, email, github);
        teamMembers.push(engineer);
        idArray.push(id);

        createTeam();
        console.log(teamMembers)
        console.log(idArray);
    }

    const addIntern = async () => {
        const response = await inquirer.prompt([
            ...getQuestions('intern'),
            {
                type: 'input',
                name: 'school',
                message: "What is your intern's school?"
            }
        ])

        const { name, id, email, school } = response;
        const intern = new Intern(name, id, email, school);
        teamMembers.push(intern);
        idArray.push(id);

        createTeam();
        console.log(teamMembers)
        console.log(idArray);
    }

    const createTeam = async () => {
        const response = await inquirer.prompt([
            {
                type: 'list',
                name: 'memberChoice',
                message: 'Which type of team member would you like to add?',
                choices: ['Engineer', 'Intern', 'Manager', "I don't want to add anymore team members"]
            }
        ]);

        switch (response.memberChoice) {
            case 'Engineer':
                addEngineer();
                break;
            case 'Intern':
                addIntern();
                break;
            case 'Manager':
                createManager();
                break;
            default:
                let html = generateHTML(teamMembers);
                console.log(html);
                await writeFile(path.join(__dirname, 'output', 'team.html'), html, 'utf-8');
                break;
        }
    }

    createTeam();

}

const generateCard = async (role, data) => {

    let card = await readFile(path.join(__dirname, './templates/', `${role}.html`), 'utf-8');

    for (let prop in data) {
        const reg = new RegExp(`{%${prop}%}`, 'gi');
        card = card.replace(reg, data[prop]);
    }

    return card
}


const generateHTML = async (teamMembers) => {

    let html = await readFile(path.join(__dirname, './templates/', 'main.html'), 'utf-8');
    let cards = '';

    for (i = 0; i < teamMembers.length; i++) {
        const { name, id, email } = teamMembers[i];
        const role = teamMembers[i].getRole().toLowerCase();

        switch (role) {
            case 'engineer':
                github = teamMembers[i].getGithub();
                break;
            case 'manager':
                officeNumber = teamMembers[i].getOfficeNumber();
                break;
            case 'intern':
                school = teamMembers[i].getSchool();
        }

        cards += await generateCard(role, { name, id, email });
    }
    return html.replace('{%CARD%}', cards);
}


teamMenu();