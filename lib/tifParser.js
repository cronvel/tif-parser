/*
	The Cedric's Swiss Knife (CSK) - CSK Tab Indented Format Parser lib
	
	The MIT License (MIT)
	
	Copyright (c) 2014 Cédric Ronvel 
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

/*
	TODO:
		Pre mark: '>'
		* a block of > form a paragraphe that is parsed as only one element
		* it is viral unless a blank line separate it from its surrounding
		* the line is understanding as it is, '#' does not produce comments	
*/



var tifParser = {} ;
module.exports = tifParser ;



tifParser.parse = function( str , options )
{
	if ( typeof str !== 'string' ) { throw new Error( "[tifParser] parse() need a string as argument #0" ) ; }
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var i , length , lines , matches , parent , previousDepth , depth , content , comment , node , ancestors = [] ;
	
	lines = str.split( '\n' ) ;
	length = lines.length ;
	
	previousDepth = 0 ;
	
	ancestors[ 0 ] = {
		depth: 0 ,
		children: []
	} ;
	
	
	for ( i = 0 ; i < length ; i ++ )
	{
		matches = lines[ i ].match( /^(\t*)(?:\s*)((?:\\#|[^#])*?)(?:\s*)(?:#\s*(.*?))?(?:\s*)$/ ) ;
		
		// If the regex do not match, then the file is fucked up (it should rarely happen)
		if ( matches === null ) { throw new Error( '[tifParser] Parse error on line ' + i + ': ' + lines[ i ] ) ; }
		
		depth = matches[ 1 ].length + 1 ;
		content = matches[ 2 ] ;
		comment = options.removeComment ? undefined : matches[ 3 ] ;
		
		// Check indentation error
		if ( depth > previousDepth + 1 ) { throw new Error( "[tifParser] Indentation error - deeper than parent's depth + 1 on line " + i + ': ' + lines[ i ] ) ; }
		
		// Check if content is only garbage of non-printable characters
		if ( ! content || ! content.match( /\S/ ) ) { content = undefined ; }
		if ( ! comment || ! comment.match( /\S/ ) ) { comment = undefined ; }
		
		// Skip empty lines
		if ( ! content && ! comment ) { continue ; }
		
		parent = ancestors[ depth - 1 ] ;
		
		node = {
			depth: depth ,
			content: content ,
			comment: comment ,
			children: []
		} ;
		
		parent.children.push( node ) ;
		
		// comment-only line do not update depth, and they cannot have children
		if ( content )
		{
			ancestors[ depth ] = node ;
			previousDepth = depth ;
		}
	}
	
	return ancestors[ 0 ] ;
} ;



