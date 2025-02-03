function initializeSVGs() {
    document.querySelector('.empty-cart').innerHTML = `
        <img src="./assets/images/illustration-empty-cart.svg" alt="Empty cart">
        <p>Your added items will appear here</p>
    `;

    document.querySelector('.delivery-info').innerHTML = `
        <img src="./assets/images/icon-carbon-neutral.svg" alt="Carbon neutral">
        <p>This is a carbon-neutral delivery</p>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSVGs();
    
    const cart = {
        items: [],
        total: 0
    };

    fetch('./data.json')
        .then(response => response.json())
        .then(desserts => {
            initializeDessertGrid(desserts);
        })
        .catch(error => {
            console.error('Error loading desserts:', error);
            document.querySelector('.dessert-grid').innerHTML = 
                '<p>Error loading desserts. Please try again later.</p>';
        });

    function initializeDessertGrid(desserts) {
        const dessertGrid = document.querySelector('.dessert-grid');
        dessertGrid.innerHTML = '';

        desserts.forEach(dessert => {
            const dessertCard = document.createElement('div');
            dessertCard.className = 'dessert-card';
            dessertCard.innerHTML = `
                <div class="dessert-image">
                    <img src="${dessert.image}" alt="${dessert.name}">
                </div>
                <div class="dessert-info">
                    <span class="category">${dessert.category}</span>
                    <h3>${dessert.name}</h3>
                    <p class="price">$${dessert.price.toFixed(2)}</p>
                </div>
                <div class="cart-controls">
                    <button class="add-to-cart">Add to Cart</button>
                    <div class="quantity-controls hidden">
                        <button class="quantity-btn decrement">
                            <img src="assets/images/icon-decrement-quantity.svg" alt="-">
                        </button>
                        <span class="quantity">1</span>
                        <button class="quantity-btn increment">
                            <img src="assets/images/icon-increment-quantity.svg" alt="+">
                        </button>
                    </div>
                </div>
            `;
            
            dessertGrid.appendChild(dessertCard);

            // Get elements
            const addToCartBtn = dessertCard.querySelector('.add-to-cart');
            const quantityControls = dessertCard.querySelector('.quantity-controls');
            const quantitySpan = dessertCard.querySelector('.quantity');
            const decrementBtn = dessertCard.querySelector('.decrement');
            const incrementBtn = dessertCard.querySelector('.increment');

            // Add to Cart click handler
            addToCartBtn.addEventListener('click', () => {
                addToCartBtn.classList.add('hidden');
                quantityControls.classList.remove('hidden');
                // Add initial item to cart with quantity 1
                updateItemInCart(dessert, 1);
            });

            // Quantity control handlers
            decrementBtn.addEventListener('click', () => {
                let quantity = parseInt(quantitySpan.textContent);
                if (quantity > 1) {
                    quantity--;
                    quantitySpan.textContent = quantity;
                    updateItemInCart(dessert, quantity);
                } else {
                    // Remove from cart if quantity becomes 0
                    addToCartBtn.classList.remove('hidden');
                    quantityControls.classList.add('hidden');
                    removeFromCart(dessert.id);
                }
            });

            incrementBtn.addEventListener('click', () => {
                let quantity = parseInt(quantitySpan.textContent);
                quantity++;
                quantitySpan.textContent = quantity;
                updateItemInCart(dessert, quantity);
            });
        });
    }

    function addToCart(dessert) {
        const existingItem = cart.items.find(item => item.id === dessert.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                ...dessert,
                quantity: 1
            });
        }
        updateCart();
    }

    function updateCart() {
        const cartItems = document.querySelector('.cart-items');
        const emptyCart = document.querySelector('.empty-cart');
        const cartCount = document.querySelector('.cart-count');
        const totalAmount = document.querySelector('.total-amount');
        
        if (cart.items.length > 0) {
            cartItems.style.display = 'block';
            emptyCart.style.display = 'none';
            
            cartItems.innerHTML = cart.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>${item.quantity}x @ $${item.price.toFixed(2)}</p>
                        </div>
                        <div class="cart-item-total">
                            <button class="delete-item" data-id="${item.id}">×</button>
                            <span>$${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add delete button event listeners
            cartItems.querySelectorAll('.delete-item').forEach(button => {
                button.addEventListener('click', () => {
                    const itemId = parseInt(button.dataset.id);
                    removeFromCart(itemId);
                });
            });
        } else {
            cartItems.style.display = 'none';
            emptyCart.style.display = 'block';
        }

        cart.total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        cartCount.textContent = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        totalAmount.textContent = `$${cart.total.toFixed(2)}`;
    }

    // Add this new function to handle item removal
    function removeFromCart(itemId) {
        cart.items = cart.items.filter(item => item.id !== itemId);
        updateCart();
    }

    // Add this new function to update item quantity in cart
    function updateItemInCart(dessert, quantity) {
        const existingItem = cart.items.find(item => item.id === dessert.id);
        if (existingItem) {
            existingItem.quantity = quantity;
        } else {
            cart.items.push({
                ...dessert,
                quantity: quantity
            });
        }
        updateCart();
    }

    // Update the confirm order handler to show order summary
    document.querySelector('.confirm-order').addEventListener('click', () => {
        if (cart.items.length > 0) {
            const modal = document.getElementById('orderModal');
            const orderSummary = modal.querySelector('.order-summary');
            const modalTotal = modal.querySelector('.modal-total');
            
            // Generate order summary HTML
            orderSummary.innerHTML = cart.items.map(item => `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="order-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.quantity}x @ $${item.price.toFixed(2)}</p>
                    </div>
                    <span class="order-item-total">$${(item.quantity * item.price).toFixed(2)}</span>
                </div>
            `).join('');
            
            modalTotal.textContent = `$${cart.total.toFixed(2)}`;
            modal.classList.add('visible');
            cart.items = [];
            updateCart();
        } else {
            alert('Please add items to your cart first.');
        }
    });

    // Update the Start New Order button handler
    document.querySelector('.start-new-order').addEventListener('click', () => {
        document.getElementById('orderModal').classList.remove('visible');
        window.location.reload();
    });
});
