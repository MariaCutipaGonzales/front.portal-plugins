# DEPENDENCIES:
# jQuery
# vtex-utils
# dust

$ = window.jQuery

# CLASS
class Minicart
	constructor: (context, options) ->
		@EXPECTED_ORDER_FORM_SECTIONS = ["items", "paymentData", "totalizers"]

		@options = options
		@context = context
		@hoverContext = @context.add('.show-minicart-on-hover')
		@cartData = {}

		@base = $('.minicartListBase').remove()

		@select =
			amountProducts: => $('.amount-products-em', @context)
			amountItems: => $('.amount-items-em', @context)
			totalCart: => $('.total-cart-em', @context)

		@bindEvents()
		@updateCart()

		$(window).trigger "minicartLoaded"

	getOrderFormURL: =>
		"/api/checkout/pub/orderForm/"

	getOrderFormUpdateURL: =>
		@getOrderFormURL() + @cartData.orderFormId + "/items/update/"

	bindEvents: =>
		@hoverContext.on 'mouseover', =>
			$(window).trigger "minicartMouseOver"
			@context.trigger 'vtex.minicart.mouseOver'

		@hoverContext.on 'mouseout', =>
			$(window).trigger "minicartMouseOut"
			@context.trigger 'vtex.minicart.mouseOut'

		$(window).on "vtex.minicart.mouseOver", =>
			if @cartData.items?.length > 0
				$(".vtexsc-cart").slideDown()
				clearTimeout @timeoutToHide

		$(window).on "vtex.minicart.mouseOut", =>
			clearTimeout @timeoutToHide
			@timeoutToHide = setTimeout ->
				$(".vtexsc-cart").stop(true, true).slideUp()
			, 800

		$(window).on "cartUpdated", @updateCart
		$(window).on 'productAddedToCart', @updateCart
		$(window).on 'vtex.cart.productAdded', @updateCart

	updateCart: =>
		@context.addClass 'amount-items-in-cart-loading'

		$.ajax({
			url: @getOrderFormURL()
			data:
				JSON.stringify expectedOrderFormSections: @EXPECTED_ORDER_FORM_SECTIONS
			dataType: "json"
			contentType: "application/json; charset=utf-8"
			type: "POST"
		})
		.done =>
			@context.removeClass 'amount-items-in-cart-loading'
			@context.trigger 'vtex.minicart.updated'
		.success (data) =>
			@cartData = data
			@prepareCart()
			@render()
			@slide()

	prepareCart: =>
		# Conditionals
		@cartData.showMinicart = @options.showMinicart
		@cartData.showTotalizers = @options.showTotalizers

		# Amount Items
		@cartData.amountItems = 0
		if @cartData.items
			@cartData.amountItems += item.quantity for item in @cartData.items

		# Total
		total = 0
		if @cartData.totalizers
			for subtotal in @cartData.totalizers
				total += subtotal.value if subtotal.id in ['Items', 'Discounts']
		@cartData.totalCart = _.intAsCurrency(total, @options)

		# Item labels
		if @cartData.items
			for item in @cartData.items
				item.availabilityMessage = @getAvailabilityMessage(item)
				item.formattedPrice = _.intAsCurrency(item.price, @options)

	render: () =>
		dust.render 'minicart', @cartData, (err, out) =>
			console.log 'Minicart Dust error: ', err if err
			@context.html out
			$(".vtexsc-productList .cartSkuRemove", @context).on 'click', =>
				@deleteItem(this)

	slide: =>
		if @cartData.items.length is 0
			@context.find(".vtexsc-cart").slideUp()
		else
			@context.find(".vtexsc-cart").slideDown()
			@timeoutToHide = setTimeout =>
				@context.find(".vtexsc-cart").stop(true, true).slideUp()
			, 3000

	deleteItem: (item) =>
		$(item).parent().find('.vtexsc-overlay').show()

		$.ajax({
			url: @getOrderFormUpdateURL()
			data:
				JSON.stringify
					expectedOrderFormSections: @EXPECTED_ORDER_FORM_SECTIONS
					orderItems: [
						index: $(item).data("index")
						quantity: 0
					]
			dataType: "json"
			contentType: "application/json; charset=utf-8"
			type: "POST"
		})
		.done =>
			@context.trigger 'vtex.minicart.updated'
		.success (data) =>
			@context.trigger 'vtex.cart.productRemoved'
			@cartData = data
			@prepareCart()
			@render()
			@slide()

	getAvailabilityCode: (item) =>
		item.availability or "available"

	getAvailabilityMessage: (item) =>
		@options.availabilityMessages[@getAvailabilityCode(item)]


# PLUGIN ENTRY POINT
$.fn.minicart = (jsOptions) ->
	defaultOptions = $.extend true, {}, $.fn.minicart.defaults
	for element in this
		$element = $(element)
		domOptions = $element.data()
		options = $.extend(true, defaultOptions, domOptions, jsOptions)
		unless $element.data('minicart')
			$element.data('minicart', new Minicart($element, options))

	return this

# PLUGIN DEFAULTS
$.fn.minicart.defaults =
	availabilityMessages:
		"available": ""
		"unavailableItemFulfillment": "Este item não está disponível no momento."
		"withoutStock": "Este item não está disponível no momento."
		"cannotBeDelivered": "Este item não está disponível no momento."
		"withoutPrice": "Este item não está disponível no momento."
		"withoutPriceRnB": "Este item não está disponível no momento."
		"nullPrice": "Este item não está disponível no momento."
	showMinicart: true
	showTotalizers: true
