# DEPENDENCIES:
# jQuery

$ = window.jQuery

# CLASSES
class Example
	constructor: (context, args, options) ->
		@context = context
		@options = options
		# get args


# PLUGIN ENTRY POINT
$.fn.example = (args, jsOptions) ->
	defaultOptions = $.extend {}, $.fn.example.defaults
	for element in this
		$element = $(element)
		domOptions = $element.data()
		options = $.extend(true, defaultOptions, domOptions, jsOptions)
		unless $element.data('example')
			$element.data('example', new Example($element, args, options))

	return this


# PLUGIN DEFAULTS
$.fn.example.defaults =
	something: true
