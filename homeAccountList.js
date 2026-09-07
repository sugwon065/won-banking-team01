const accountList = document.querySelector(
    '#home-screen .account-list'
);

const createElement = (tag, className, text) => {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
};

const createIcon = symbolName => {
    const svg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
    );

    svg.classList.add('icon');
    svg.setAttribute('aria-hidden', 'true');

    const use = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'use'
    );

    use.setAttribute('href', `#i-${symbolName}`);
    svg.append(use);

    return svg;
};

const createBankIcon = index => {
    const iconClass =
        index === 1
            ? 'bank-icon green'
            : index === 2
                ? 'bank-icon purple'
                : 'bank-icon';

    const bankIcon = createElement('span', iconClass);

    if (index === 1) {
        bankIcon.append(createIcon('save'));
    } else if (index === 2) {
        bankIcon.append(createIcon('plane'));
    } else {
        bankIcon.textContent = 'W';
    }

    bankIcon.setAttribute('aria-hidden', 'true');

    return bankIcon;
};

const createBalance = balance => {
    const balanceElement = createElement(
        'span',
        'account-balance'
    );

    const visibleBalance = createElement(
        'span',
        'unmasked',
        Number(balance ?? 0).toLocaleString('ko-KR')
    );

    const won = createElement('small', null, '원');
    visibleBalance.append(won);

    const maskedBalance = createElement(
        'span',
        'masked',
        '금액 숨김'
    );

    balanceElement.append(visibleBalance, maskedBalance);

    return balanceElement;
};

const createAccountCard = (account, index) => {
    const article = createElement('article');

    article.dataset.accountId = account.id ?? '';

    const accountInfo = createElement('div', 'account-info');

    const nickname = createElement(
        'h3',
        null,
        account.nickname ?? '계좌'
    );

    const description = createElement(
        'p',
        null,
        `${account.accountNo ?? ''} ${account.type ?? ''}`
    );

    accountInfo.append(nickname, description);

    article.className = 'account-card';

    const title = createElement('div', 'account-title');

    title.append(
        createBankIcon(index),
        accountInfo,
        createIcon('chevron')
    );

    const bottom = createElement('div', 'account-bottom');

    const isSavings = String(account.type ?? '').includes('적금');

    let transferButton = '';

    if (!isSavings) {
        transferButton = createElement(
            'label',
            'small-button',
            '이체'
        );

        transferButton.htmlFor = 'view-transfer';
    }

    bottom.append(
        createBalance(account.balance),
        transferButton
    );

    article.append(title, bottom);

    return article;
};

const getAccountList = async () => {
    if (!accountList) {
        console.error(
            '#home-screen .account-list 요소를 찾을 수 없습니다.'
        );
        return;
    }

    try {
        const response = await fetch(
            'http://localhost:4000/api/accounts'
        );

        if (!response.ok) {
            throw new Error(`요청 실패: ${response.status}`);
        }

        const data = await response.json();

        const accounts = Array.isArray(data)
            ? data
            : Array.isArray(data.accounts)
                ? data.accounts
                : [data];

        const fragment = document.createDocumentFragment();

        accounts.forEach((account, index) => {
            fragment.append(
                createAccountCard(account, index)
            );
        });

        accountList.replaceChildren(fragment);

    } catch (error) {
        console.error(error);

        const message = createElement(
            'p',
            'empty-state',
            '계좌 정보를 불러오지 못했습니다.'
        );

        accountList.replaceChildren(message);
    }
};

getAccountList();